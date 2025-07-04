# frozen_string_literal: true

module Frontend
  module Characters
    class BonusesController < Frontend::BaseController
      include Deps[
        add_daggerheart_bonus: 'commands.characters_context.daggerheart.add_bonus'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_character
      before_action :find_character_bonus, only: %i[destroy]

      def index
        serialize_relation(bonuses, ::Characters::BonusSerializer, :bonuses)
      end

      def create
        case add_bonus_command.call(create_params.merge(character: @character))
        in { errors: errors } then unprocessable_response(errors)
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
        else Character.none
        end
      end

      def add_bonus_command
        case params[:provider]
        when 'daggerheart' then add_daggerheart_bonus
        end
      end

      def create_params
        params.require(:bonus).permit!.to_h
      end
    end
  end
end
