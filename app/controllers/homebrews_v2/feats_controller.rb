# frozen_string_literal: true

module HomebrewsV2
  class FeatsController < HomebrewsV2::BaseController
    include SerializeRelation
    include SerializeResource

    before_action :find_feat, only: %i[show]
    before_action :find_another_feat, only: %i[copy]

    def index
      serialize_relation(feats, serializer, :homebrews, { only: %i[id title own] }, { current_user_id: current_user.id })
    end

    def show
      serialize_resource(@feat, serializer, :homebrew)
    end

    def copy
      case copy_command
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result }
        serialize_resource(
          result, serializer, :homebrew, { only: %i[id title own] }, :created, { current_user_id: current_user.id }
        )
      end
    end

    private

    def find_feat
      @feat = class_name.find(params.expect(:id))
    end

    def find_another_feat
      @feat = feats.find(params.expect(:id))
    end
  end
end
