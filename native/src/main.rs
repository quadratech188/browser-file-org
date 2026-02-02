use serde::{self};
use std::{env, fs, io::{self, Read, Write, stdout}, path};

mod install;

#[derive(serde::Deserialize)]
#[serde(rename_all = "snake_case")]
enum DestExistsBehavior {
    Overwrite,
    Error,
    DeleteOrigin
}

#[derive(serde::Deserialize)]
#[serde(default)]
struct Opts {
    dest_exists: DestExistsBehavior
}

impl Default for Opts {
    fn default() -> Self {
        Self {
            dest_exists: DestExistsBehavior::Error
        }
    }
}

#[derive(serde::Deserialize)]
struct Request {
    origin: path::PathBuf,
    dest: path::PathBuf,
    opts: Opts
}



#[derive(serde::Serialize)]
#[serde(tag = "type", content = "message", rename_all = "snake_case")]
enum Error {
    NoOrigin,
    NoDestDir,
    DestExists,

    Parsing(String),
    Unknown(String)
}

enum StateType {
    Moved,
    Deleted,
    Error(Error)
}

struct State {
    location: Option<path::PathBuf>,
    r#type: StateType
}

impl From<io::Error> for Error {
    fn from(value: io::Error) -> Self {
        Self::Unknown(value.to_string())
    }
}

fn read_message() -> io::Result<Vec<u8>> {
    let mut len_buf = [0u8; 4];
    io::stdin().read_exact(&mut len_buf)?;
    let len = u32::from_ne_bytes(len_buf) as usize;
    let mut buf = vec![0u8; len];
    io::stdin().read_exact(&mut buf)?;
    Ok(buf)
}

fn write_message(msg: &String) -> io::Result<()> {
    let len = msg.len() as u32;
    stdout().write_all(&len.to_ne_bytes())?;
    stdout().write_all(&msg.as_bytes())?;
    stdout().flush()?;

    Ok(())
}

#[derive(serde::Serialize)]
#[serde(rename_all = "snake_case")]
enum MoveResult {
    Moved,
    Deleted
}

fn move_file(request: &Request) -> Result<MoveResult, Error> {
    if !request.origin.exists() {
        return Err(Error::NoOrigin)
    }
    if request.dest.parent().map_or(false, |p| !p.exists()) {
        return Err(Error::NoDestDir)
    }
    if request.dest.exists() {
        match request.opts.dest_exists {
            DestExistsBehavior::DeleteOrigin => {
                fs::remove_file(&request.origin)?;
                return Ok(MoveResult::Deleted)
            }
            DestExistsBehavior::Error => return Err(Error::DestExists),
            DestExistsBehavior::Overwrite => fs::remove_file(&request.dest)?
        }
    }

    if fs::rename(&request.origin, &request.dest).is_err() {
        fs::copy(&request.origin, &request.dest)?;
        fs::remove_file(&request.origin)?;
    }
    
    Ok(MoveResult::Moved)
}

fn main() -> io::Result<()> {
    let args: Vec<String> = env::args().collect();
    // Native Messaging passes the extension id as argv[1], so we can't just check for argv[1]
    if args.len() > 2 && args[1] == "install" {
        install::install(&args[2]);
        return Ok(())
    };

    let result: Result<MoveResult, Error> = (|| {
        let buf = read_message()?;
        let req: Request = serde_json::from_slice(&buf).map_err(|e| {
            Error::Parsing(e.to_string())
        })?;
        move_file(&req)
    })();

    write_message(&serde_json::to_string(&result).expect("Failed to serialize result"))
}
