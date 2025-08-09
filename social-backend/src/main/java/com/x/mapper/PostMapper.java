package com.x.mapper;

import com.x.pojo.dto.PostCommentDTO;
import com.x.pojo.dto.PostDTO;
import com.x.pojo.dto.PostLikeDTO;
import com.x.pojo.dto.SendPostDTO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PostMapper {
    List<PostDTO> getFriendPosts(@Param("friendIds") List<Long> friendIds);

    List<PostCommentDTO> getCommentsByPostIds(@Param("postIds") List<Long> postIds);

    List<PostLikeDTO> getLikesByPostIds(@Param("postIds") List<Long> postIds);

    @Insert("insert into post (user_id,content,image_urls) values (#{userId},#{content},#{imageUrls})")
    void sendPost(SendPostDTO sendPostDTO);

    @Insert("delete from post where id=#{id}")
    void deletePost(Long id);

    List<PostDTO> getAllPosts();

    List<PostCommentDTO> getAllComments();

    List<PostLikeDTO> getAllLikes();

    List<Long> getPostGrowthData();

    @Select("select count(*) from post")
    Long getPostTotal();

    List<PostDTO> getPostsById(Long friendId);
}