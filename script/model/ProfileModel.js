import { MissingDataError } from "../entities/Errors.js";

export default class ProfileModel {
  constructor() {
    this.profile = {
      imgUrl: '',
      name: '',
      id: '',
      email: '',
      country: '',
      followers: '',
      product: '',
    }

    this.topArtists = {
      items: null,
    }

    this.topTracks = {
      items: null,
    }
  }

  updateUserProfileProperties(data) {
    const { images, display_name, id, email, country, followers, product } = data;

    if (!display_name || !id || !email || !country || followers === undefined || !product) {
      throw new MissingDataError('User profile data is missing or invalid.');
    }

    this.profile.imgUrl = images && images.length > 1 ? images[0].url : null;
    this.profile.name = display_name;
    this.profile.id = id;
    this.profile.email = email;
    this.profile.country = country;
    this.profile.followers = followers.total !== undefined ? followers.total : 0;
    this.profile.product = product;
  }

  updateUserTops(data, scope) {
    if (Array.isArray(data.items) && data.items.length > 0) {
      this[scope].items = data.items;
    } else {
      throw new MissingDataError(`Items data is missing or invalid in ${scope}.`);
    }
  }
}