# frozen_string_literal: true

module Homebrews
  module Dnd
    class SubclassesController < Homebrews::BaseController
      include Deps[
        add_subclass: 'commands.homebrew_context.dnd.subclasses.add',
        change_subclass: 'commands.homebrew_context.dnd.subclasses.change',
        copy_subclass: 'commands.homebrew_context.dnd.subclasses.copy'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_subclasses, only: %i[index]
      before_action :find_subclass, only: %i[show update destroy]
      before_action :find_features, only: %i[index show]
      before_action :find_existing_characters, only: %i[destroy]
      before_action :find_another_subclass, only: %i[copy]

      def index
        serialize_relation(
          @subclasses,
          ::Homebrews::Dnd::SubclassSerializer,
          :subclasses,
          {},
          { features: @features, current_user_id: current_user.id }
        )
      end

      def show
        serialize_resource(
          @subclass,
          ::Homebrews::Dnd::SubclassSerializer,
          :subclass,
          {},
          :ok,
          { features: @features, current_user_id: current_user.id }
        )
      end

      def create
        case add_subclass.call(subclass_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::Homebrews::Dnd::SubclassSerializer, :subclass, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      def update
        case change_subclass.call(subclass_params.merge(subclass: @subclass))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Dnd::SubclassSerializer, :subclass, {}, :ok)
        end
      end

      def destroy
        @kept ? @subclass.discard : @subclass.destroy
        only_head_response
      end

      def copy
        case copy_subclass.call({ subclass: @subclass, user: current_user })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Dnd::SubclassSerializer, :subclass, {}, :created)
        end
      end

      private

      def find_subclasses
        @subclasses =
          ::Dnd2024::Homebrew::Subclass.where(user_id: current_user.id)
            .or(
              ::Dnd2024::Homebrew::Subclass.where.not(user_id: current_user.id).where(public: true)
            ).kept.order(created_at: :desc)
      end

      def find_features
        @features =
          ::Dnd2024::Feat
            .where(origin_value: @subclasses ? @subclasses.pluck(:id) : @subclass.id)
            .order(created_at: :asc)
      end

      def find_subclass
        @subclass = ::Dnd2024::Homebrew::Subclass.kept.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_another_subclass
        @subclass = ::Dnd2024::Homebrew::Subclass.kept.where.not(user_id: current_user.id).find(params[:id])
      end

      def find_existing_characters
        subclasses = ::Dnd2024::Character.pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:values).exclude?(@subclass.id)

        @kept = true
      end

      def subclass_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
