# frozen_string_literal: true

module Frontend
  module Fallout
    module Characters
      class TalentsController < Frontend::BaseController
        include Deps[
          add_talent: 'commands.characters_context.fallout.talents.add'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_talent, only: %i[create]

        def index
          serialize_relation(
            ::Fallout::Feat.where(origin: 0),
            ::Fallout::Characters::TalentSerializer,
            :perks,
            {},
            { perks: @character.data.perks }
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
          @character = authorized_scope(Character.all).fallout.find(params[:character_id])
        end

        def find_talent
          @talent = ::Fallout::Feat.where(origin: 0).find(params[:talent_id])
        end
      end
    end
  end
end
