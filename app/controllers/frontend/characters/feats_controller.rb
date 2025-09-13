# frozen_string_literal: true

module Frontend
  module Characters
    class FeatsController < Frontend::BaseController
      include Deps[
        change_feat: 'commands.characters_context.change_feat'
      ]

      before_action :find_character
      before_action :find_character_feat, only: %i[update]

      def update
        case change_feat.call(update_params.merge({ character_feat: @character_feat }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      private

      def find_character
        @character = characters_relation.find(params[:character_id])
      end

      def find_character_feat
        @character_feat = @character.feats.find(params[:id])
      end

      def update_params
        params.require(:character_feat).permit!.to_h
      end

      def characters_relation
        case params[:provider]
        when 'dnd5', 'dnd2024' then authorized_scope(Character.all).dnd
        when 'pathfinder2' then authorized_scope(Character.all).pathfinder2
        when 'daggerheart' then authorized_scope(Character.all).daggerheart
        else Character.none
        end
      end
    end
  end
end
