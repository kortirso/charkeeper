# frozen_string_literal: true

module HomebrewsV2
  class HomebrewController < HomebrewsV2::BaseController
    include SerializeResource

    before_action :find_element, only: %i[show]
    before_action :find_own_element, only: %i[destroy]
    before_action :find_features, only: %i[show]
    before_action :find_existing_characters, only: %i[destroy]

    def show
      serialize_resource(@element, serializer, :homebrew, {}, :ok, { features: @features })
    end

    def destroy
      @kept ? @element.discard : @element.destroy
      only_head_response
    end

    private

    def find_element
      @element = class_name.kept.find(params.expect(:id))
    end

    def find_own_element
      @element = class_name.kept.find_by!(id: params.expect(:id), user_id: current_user.id)
    end

    def find_features
      @features = feat_class.where(origin_value: @element.id).includes(:items).order(created_at: :asc)
    end

    def characters_relation
      character_class.where(user_id: current_user.id)
    end
  end
end
