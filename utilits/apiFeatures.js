class APIFeatures {
  constructor(query, queryString) {
    this.query = query;

    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const execludeFiled = ["page", "sort", "limit", "fields"];
    execludeFiled.forEach((el) => delete queryObj[el]);
    // console.log(req.query, queryObj);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
    // oporer code ta kivabe run kre ta niche dekhano holo
    // const features=new APIFeatures(Tour.find(),req.query).filter()
    // const tours = await features.query
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitfield() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  pagenation() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
