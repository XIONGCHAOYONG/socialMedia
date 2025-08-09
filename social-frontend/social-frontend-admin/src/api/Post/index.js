import request from "@/utils/request";

function getAllPosts() {
  return request({
    url: '/admin/post/get',
    method: 'get'
  })
}
function deleteById(id) {
  return request({
    url: `/admin/post/delete/${id}`,
    method: 'delete'
  })
}
export default { getAllPosts, deleteById }