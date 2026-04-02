import userRepository from "../repositories/userRepository.js";

class UserService {
  async getAllUsers() {
    return userRepository.findAll();
  }

  async getUserById(id: number) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

export default new UserService();