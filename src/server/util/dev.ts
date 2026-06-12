const LOCAL_LOGGING = false

//msg is logged and group can be used to filter for certain logs to cli output
export function localLog(msg: any, _group: string) {
  if (LOCAL_LOGGING) {
    console.log(msg)
  }
}
