# frozen_string_literal: true

module Frontend
  module Dnd2024
    module Characters
      class TalentsController < Frontend::BaseController
        include Deps[
          add_talent: 'commands.characters_context.dnd2024.talents.add'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_talent, only: %i[create]

        def index
          serialize_relation_v2(
            available_talents,
            ::Dnd2024::Characters::TalentSerializer,
            :talents,
            context: { selected_talents: @selected_talents },
            order_options: { key: 'title' }
          )
        end

        def create
          case add_talent.call({ character: @character, talent: @talent, additional: params[:additional] }.compact)
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dnd2024.find(params[:character_id])
        end

        def find_talent
          @talent = ::Dnd2024::Feat.where(origin: 4).find(params[:talent_id])
        end

        def available_talents
          @selected_talents = @character.data.selected_talents.keys
          data = @character.data
          talents_relation.select do |talent|
            data.level >= talent.conditions['level'].to_i
          end
        end

        def talents_relation
          relation = ::Dnd2024::Feat.where(origin: 4, origin_value: %w[origin general epic])
          relation.where(user_id: [current_user.id, nil]).or(relation.where(id: homebrew_item_ids))
        end

        def homebrew_item_ids
          ::Homebrew::Book::Item
            .where(homebrew_book_id: ::User::Book.where(user_id: current_user).select(:homebrew_book_id))
            .where(itemable_type: 'Dnd2024::Feat')
            .pluck(:itemable_id)
        end
      end
    end
  end
end
