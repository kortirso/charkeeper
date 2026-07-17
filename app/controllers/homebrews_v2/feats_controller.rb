# frozen_string_literal: true

module HomebrewsV2
  class FeatsController < HomebrewsV2::BaseController
    include SerializeRelation
    include SerializeResource

    before_action :find_feats, only: %i[index]
    before_action :find_upvotes, only: %i[index]
    before_action :find_feat, only: %i[show]
    before_action :find_feats_for_batch_destroy, only: %i[batch_destroy]

    def index
      serialize_relation_v2(
        @feats,
        serializer,
        :homebrews,
        serialized_fields: { only: %i[id title own books upvotes_count upvoted] },
        order_options: order_options,
        context: { current_user_id: current_user.id, upvotes: @upvotes }
      )
    end

    def show
      serialize_resource(@feat, serializer, :homebrew)
    end

    def batch_destroy
      @feats.destroy_all
      only_head_response
    end

    private

    def find_upvotes
      @upvotes = current_user.upvotes.where(upvoteable_type: 'Feat').pluck(:upvoteable_id)
    end

    def find_feat
      @feat = class_name.find(params.expect(:id))
    end

    def find_another_feat
      @feat = @feats.find(params.expect(:id))
    end

    def find_feats_for_batch_destroy
      @feats = class_name.where(user_id: current_user.id, id: params[:ids])
    end
  end
end
