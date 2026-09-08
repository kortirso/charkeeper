# frozen_string_literal: true

module Frontend
  module Characters
    module Feats
      class ChangesController < Frontend::BaseController
        include Deps[
          change_feat: 'commands.characters_context.feats.update'
        ]
        include SerializeResource

        before_action :find_character
        before_action :find_feat

        def update
          case change_feat.call(update_params.merge({ feat: @character_feat.feat }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else serialize_resource(@character_feat, ::Characters::FeatSerializer, :feat, {}, :ok)
          end
        end

        private

        def find_character
          @character = characters_relation.find(params.expect(:character_id))
        end

        def find_feat
          @character_feat = ::Character::Feat.where(character: @character.id).find(params.expect(:feat_id))
        end

        def update_params
          params.require(:feat).permit!.to_h
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
end
