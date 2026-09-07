# frozen_string_literal: true

module Frontend
  module Characters
    class FeatsController < Frontend::BaseController
      include Deps[
        create_feat: 'commands.characters_context.feats.create',
        change_feat: 'commands.characters_context.change_feat'
      ]
      include SerializeResource

      before_action :find_character
      before_action :find_character_feat, only: %i[update]
      before_action :find_feat, only: %i[destroy]

      def create
        case create_feat.call(create_params.merge({ character: @character }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Characters::FeatSerializer, :feat, {}, :created)
        end
      end

      def update
        case change_feat.call(update_params.merge({ character_feat: @character_feat }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def destroy
        @feat.destroy
        only_head_response
      end

      private

      def find_character
        @character = characters_relation.find(params.expect(:character_id))
      end

      def find_character_feat
        relation = ::Character::Feat.joins(:character)
        @character_feat =
          relation.where(character_id: @character.id).or(
            relation.where(characters: { parent_id: @character.id })
          ).find(params.expect(:id))
      end

      def find_feat
        @feat = ::Feat.where(origin: 'character', origin_value: @character.id).find(params.expect(:id))
      end

      def create_params
        params.require(:feat).permit!.to_h
      end

      def update_params
        params.require(:character_feat).permit!.to_h
      end

      def characters_relation # rubocop: disable Metrics/AbcSize
        case params[:provider]
        when 'dnd5', 'dnd2024' then authorized_scope(Character.all).dnd
        when 'pathfinder2' then authorized_scope(Character.all).pathfinder2
        when 'daggerheart' then authorized_scope(Character.all).daggerheart
        when 'dc20' then authorized_scope(Character.all).dc20
        when 'cosmere' then authorized_scope(Character.all).cosmere
        when 'nimble' then authorized_scope(Character.all).nimble
        else Character.none
        end
      end
    end
  end
end
