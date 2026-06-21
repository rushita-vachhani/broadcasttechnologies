import mongoose from "mongoose";

const subTodoschema = new mongoose.Schema({
    
}, {timestamps: true});

export const SubTodo = mongoose.model("SubTodo", subTodoschema);
