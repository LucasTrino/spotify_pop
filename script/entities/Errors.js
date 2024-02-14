class MissingDataError extends Error {
  constructor(message = 'Data is missing or invalid.') {
    super(message);
    this.name = this.constructor.name;
    console.log(message);
  }
}

class RequestFailedError extends Error {
  constructor(message = 'Request failed.') {
    super(message);
    this.name = this.constructor.name;
    console.log(message);
  }
}

class InvalidInputError extends Error {
  constructor(message = 'Invalid input error') {
    super(message);
    this.name = this.constructor.name;
  }
}

export { MissingDataError, RequestFailedError, InvalidInputError };