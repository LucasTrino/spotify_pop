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
  }

  updateUserProfileProperties(data) {
    const { images, display_name, id, email, country, followers, product } = data;

    this.profile.imgUrl = images && images.length > 1 ? images[1].url : null;
    this.profile.name = display_name;
    this.profile.id = id;
    this.profile.email = email;
    this.profile.country = country;
    this.profile.followers = followers.total;
    this.profile.product = product;
  }

  updateUserTopArtists(data) {
    this.topArtists.items = data.items ? data.items : null;
  }

}