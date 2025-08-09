import request from "@/utils/request";

function getPosts(userId) {
  return request({
    url: `/user/post/getPosts/${userId}`,
    method: "get",
  });
}
function sendPost(data) {
  return request({
    url: "/user/post/sendPost",
    method: "post",
    data
  });
}
function deletePost(id) {
  return request({
    url: `/user/post/deletePost/${id}`,
    method: "delete"
  });
}
export default { getPosts, sendPost, deletePost };