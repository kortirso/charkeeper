# frozen_string_literal: true

module Frontend
  module Characters
    class BonusesController < Frontend::BaseController
      include Deps[
        add_dnd_bonus: 'commands.characters_context.dnd5.add_bonus',
        add_daggerheart_bonus: 'commands.characters_context.daggerheart.add_bonus',
        feature_requirement: 'feature_requirement',
        add_dnd_bonus_v2: 'commands.characters_context.dnd2024.bonuses.add',
        add_daggerheart_bonus_v2: 'commands.characters_context.daggerheart.bonuses.add',
        change_command: 'commands.bonuses_context.change'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_character
      before_action :find_character_bonus, only: %i[update destroy]

      def index
        serialize_relation(bonuses, ::Characters::BonusSerializer, :bonuses)
      end

      def create
        case add_bonus_command.call(create_params.merge(bonusable: @character))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Characters::BonusSerializer, :bonus, {}, :created)
        end
      end

      def update
        case change_command.call(update_params.merge(character_bonus: @character_bonus))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def destroy
        @character_bonus.destroy
        only_head_response
      end

      private

      def find_character
        @character = characters_relation.find(params[:character_id])
      end

      def find_character_bonus
        @character_bonus = @character.bonuses.find(params[:id])
      end

      def bonuses
        @character.bonuses.order(created_at: :desc)
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

      def add_bonus_command
        if feature_requirement.call(current: params[:version], initial: '0.3.23')
          case params[:provider]
          when 'dnd5', 'dnd2024' then add_dnd_bonus_v2
          when 'daggerheart' then add_daggerheart_bonus_v2
          end
        else
          case params[:provider]
          when 'dnd5', 'dnd2024' then add_dnd_bonus
          when 'daggerheart' then add_daggerheart_bonus
          end
        end
      end

      def create_params
        params.require(:bonus).permit!.to_unsafe_hash.deep_symbolize_keys
      end

      def update_params
        params.require(:bonus).permit!.to_h
      end
    end
  end
end
