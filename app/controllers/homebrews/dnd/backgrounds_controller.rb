# frozen_string_literal: true

module Homebrews
  module Dnd
    class BackgroundsController < Homebrews::BaseController
      include Deps[
        add_dnd_background: 'commands.homebrew_context.dnd.backgrounds.add',
        change_dnd_background: 'commands.homebrew_context.dnd.backgrounds.change',
        copy_dnd_background: 'commands.homebrew_context.dnd.backgrounds.copy'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_backgrounds, only: %i[index]
      before_action :find_background, only: %i[update destroy]
      before_action :find_existing_characters, only: %i[destroy]
      before_action :find_another_background, only: %i[copy]

      def index
        serialize_relation_v2(
          @backgrounds,
          ::Homebrews::Dnd::BackgroundSerializer,
          :backgrounds,
          context: { current_user_id: current_user.id }
        )
      end

      def create
        case add_dnd_background.call(background_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::Homebrews::Dnd::BackgroundSerializer, :background, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      def update
        case change_dnd_background.call(background_params.merge(background: @background))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Dnd::BackgroundSerializer, :background, {}, :ok)
        end
      end

      def destroy
        @kept ? @background.discard : @background.destroy
        only_head_response
      end

      def copy
        case copy_dnd_background.call({ background: @background, user: current_user })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Dnd::BackgroundSerializer, :background, {}, :created)
        end
      end

      def origin_feats
        serialize_relation_v2(
          talents_relation,
          ::Dnd2024::Characters::TalentSerializer,
          :talents,
          order_options: { key: 'title' },
          serialized_fields: { only: %i[id title] }
        )
      end

      private

      def find_backgrounds
        @backgrounds =
          ::Dnd2024::Homebrew::Background.where(user_id: current_user.id)
            .or(
              ::Dnd2024::Homebrew::Background.where.not(user_id: current_user.id).where(public: true)
            ).kept.order(created_at: :desc)
      end

      def find_background
        @background = ::Dnd2024::Homebrew::Background.kept.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_another_background
        @background = ::Dnd2024::Homebrew::Background.kept.where.not(user_id: current_user.id).find(params[:id])
      end

      def find_existing_characters
        unless ::Dnd2024::Character.where(user_id: current_user.id).exists?(["data ->> 'background' = ?", @background.id])
          return
        end

        @kept = true
      end

      def talents_relation
        relation = ::Dnd2024::Feat.where(origin: 4, origin_value: 'origin')
        relation.where(user_id: [current_user.id, nil]).or(relation.where(id: homebrew_item_ids))
      end

      def homebrew_item_ids
        ::Homebrew::Book::Item
          .where(homebrew_book_id: ::User::Book.where(user_id: current_user).select(:homebrew_book_id))
          .where(itemable_type: 'Dnd2024::Feat')
          .pluck(:itemable_id)
      end

      def background_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
