import User from "./../models/user.js";

const getUser = async (id) => {
    const users = await User.find();

    var selectedUser = users.filter(u => u.googleId === String(id))[0];

    if (!selectedUser)
        selectedUser = await User.findById(id);

    return selectedUser;
}

export default getUser;