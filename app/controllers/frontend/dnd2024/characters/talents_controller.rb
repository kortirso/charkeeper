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
          serialize_relation(
            available_talents, ::Dnd2024::Characters::TalentSerializer, :talents, {}, { selected_talents: @selected_talents }
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

        def available_talents # rubocop: disable Metrics/AbcSize
          @selected_talents = @character.data.selected_talents.keys
          data = @character.data

          ::Dnd2024::Feat.where(origin: 4, origin_value: %w[origin general epic]).select do |talent|
            next false if data.level < talent.conditions['level'].to_i
            next true if talent.conditions['ability'].blank?
            next false if data.abilities.slice(*talent.conditions['ability']).values.none? { |item| item >= 13 }

            true
          end
        end
      end
    end
  end
end
