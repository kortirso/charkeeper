# frozen_string_literal: true

module Frontend
  module Dnd2024
    module Characters
      module Items
        class UpgradeController < Frontend::BaseController
          include Deps[
            upgrade_command: 'commands.characters_context.dnd2024.upgrade.perform'
          ]
          include SerializeResource

          before_action :find_character
          before_action :find_character_item
          before_action :find_character_bonus

          def create
            case upgrade_command.call(upgrade_merged_params)
            in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
            in { result: result } then serialize_resource(result, ::ItemSerializer, :item, {}, :created)
            end
          end

          private

          def find_character
            @character = authorized_scope(Character.all).dnd2024.find(params[:character_id])
          end

          def find_character_item
            @character_item = @character.items.find(params[:item_id])
          end

          def find_character_bonus
            @character_bonus = @character.bonuses.find(upgrade_params[:bonus_id])
          end

          def upgrade_merged_params
            upgrade_params.merge({ character: @character, character_item: @character_item, character_bonus: @character_bonus })
          end

          def upgrade_params
            params.require(:upgrade).permit!.to_h.deep_symbolize_keys
          end
        end
      end
    end
  end
end
