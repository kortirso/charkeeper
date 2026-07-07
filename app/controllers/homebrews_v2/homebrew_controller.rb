# frozen_string_literal: true

module HomebrewsV2
  class HomebrewController < HomebrewsV2::BaseController
    include SerializeResource

    before_action :find_element, only: %i[show]
    before_action :find_own_element, only: %i[destroy]
    before_action :find_features, only: %i[show]
    before_action :find_existing_characters, only: %i[destroy]
    before_action :find_another_element, only: %i[copy]

    def show
      serialize_resource(@element, serializer, :homebrew, {}, :ok, { features: @features })
    end

    def destroy
      @kept ? @element.discard : @element.destroy
      only_head_response
    end

    def copy
      case copy_command
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result }
        serialize_resource(
          result, ::HomebrewsV2::ListElementSerializer, :homebrew, {}, :created, { current_user_id: current_user.id }
        )
      end
    end

    private

    def find_element
      @element = class_name.kept.find(params.expect(:id))
    end

    def find_own_element
      @element = class_name.kept.find_by!(id: params.expect(:id), user_id: current_user.id)
    end

    def find_features
      @features = ::Daggerheart::Feat.where(origin_value: @element.id).includes(:items).order(created_at: :asc)
    end

    def find_another_element
      @element = class_name.kept.where.not(user_id: current_user.id).find(params.expect(:id))
    end

    def characters_relation
      ::Daggerheart::Character.where(user_id: current_user.id)
    end
  end
end
