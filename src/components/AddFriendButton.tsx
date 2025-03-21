"use client";
import { addFriendValidator } from "@/lib/validations/validateFriend";
import Button from "./ui/Button";
import axios from "axios";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const AddFriendButton = () => {
  const [showStateSuccess, setShowStateSuccess] = useState<boolean>(false);

  type FormData = z.infer<typeof addFriendValidator>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  async function addFriend(email: string) {
    try {
      const parsedData = addFriendValidator.safeParse({ email });
      await axios.post("/api/friends/add", {
        email: parsedData.data?.email,
      });
      setShowStateSuccess(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
        return;
      }
      if (error instanceof axios.AxiosError) {
        setError("email", { message: error.response?.data });
        return;
      }
      setError("email", { message: "Something went wrong" });
    }
  }

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
      <label
        htmlFor="email"
        className="block test-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-Mail
      </label>
      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          placeholder="you@example.com"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        <Button>Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
      {showStateSuccess ? (
        <p className="mt-1 text-sm text-green-600">Friend request sent</p>
      ) : null}
    </form>
  );
};

export default AddFriendButton;
