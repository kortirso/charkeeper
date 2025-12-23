# frozen_string_literal: true

module Frontend
  module Characters
    module Bonuses
      class ConsumeController < Frontend::BaseController
        include Deps[
          consume_command: 'commands.bonuses_context.consume'
        ]
        include SerializeResource

        before_action :find_character
        before_action :find_bonus
        before_action :find_character_item

        def create
          case consume_command.call(command_params)
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result } then serialize_resource(result, ::Characters::BonusSerializer, :bonus, {}, :created)
          end
        end

        private

        def find_character
          @character = characters_relation.find(params[:character_id])
        end

        def find_bonus
          @character_bonus = Character::Bonus.find(params[:bonuse_id])
        end

        def find_character_item
          @character_item = Character::Item.find(params[:character_item_id])
        end

        def characters_relation
          case params[:provider]
          when 'dnd5', 'dnd2024' then authorized_scope(Character.all).dnd
          when 'pathfinder2' then authorized_scope(Character.all).pathfinder2
          when 'daggerheart' then authorized_scope(Character.all).daggerheart
          when 'dc20' then authorized_scope(Character.all).dc20
          else Character.none
          end
        end

        def command_params
          {
            character: @character,
            character_bonus: @character_bonus,
            from_state: params[:from_state],
            character_item: @character_item
          }
        end
      end
    end
  end
end
