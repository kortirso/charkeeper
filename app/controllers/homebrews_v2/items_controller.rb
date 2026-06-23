# frozen_string_literal: true

module HomebrewsV2
  class ItemsController < HomebrewsV2::BaseController
    include SerializeRelation
    include SerializeResource

    before_action :find_item, only: %i[show]
    before_action :find_own_item, only: %i[destroy]
    before_action :find_another_item, only: %i[copy]

    def index
      serialize_relation(items, serializer, :homebrews, {}, { current_user_id: current_user.id })
    end

    def show
      serialize_resource(@item, show_serializer, :homebrew)
    end

    def destroy
      @item.destroy
      only_head_response
    end

    def copy
      case HomebrewsV2Context::Import::Daggerheart::Specialities::CopyCommand.new.call({
        item: @item, user: current_user
      })
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result }
        serialize_resource(result, serializer, :homebrew, {}, :created, { current_user_id: current_user.id })
      end
    end

    private

    def items
      class_name.where(user_id: current_user.id).or(class_name.where(public: true)).where(kind: params.expect(:type).split(','))
    end

    def find_item
      @item = class_name.find(params.expect(:id))
    end

    def find_own_item
      @item = class_name.find_by!(id: params.expect(:id), user_id: current_user.id)
    end

    def find_another_item
      @item = class_name.where.not(user_id: current_user.id).find(params.expect(:id))
    end
  end
end
