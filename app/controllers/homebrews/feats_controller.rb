# frozen_string_literal: true

module Homebrews
  class FeatsController < Homebrews::BaseController
    include SerializeRelation
    include SerializeResource

    before_action :find_feats, only: %i[index]
    before_action :find_feat, only: %i[destroy]

    def index
      serialize_relation(@feats, serializer, :feats)
    end

    def create
      case add_feat.call(create_params.merge(user: current_user, bonuses: bonuses_params))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result } then serialize_resource(result, serializer, :feat, {}, :created)
      end
    end

    def destroy
      @feat.destroy
      only_head_response
    end
  end
end
