import request from "@/utils/request";

function get() {
  return request({
    url: '/admin/group/get',
    method: 'get'
  })
}
function getMembers(id) {
  return request({
    url: `/admin/group/getMembers/${id}`,
    method: 'get'
  })
}

function deleteById(id) {
  return request({
    url: `/admin/group/delete/${id}`,
    method: 'delete'
  })
}

export default { get, getMembers, deleteById }