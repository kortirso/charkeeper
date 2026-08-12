# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      class SummonsController < Frontend::Dc20::BaseController
        include Deps[
          create_summon: 'commands.characters_context.dc20.summons.create'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_summons, only: %i[index]
        before_action :find_summon, only: %i[update destroy]

        def index
          serialize_relation_v2(@summons, ::Dc20::SummonSerializer, :summons)
        end

        def create
          case create_summon.call(summon_params.merge({ parent: @character }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Dc20::SummonSerializer, :summon, {}, :created)
          end
        end

        def update; end

        def destroy
          @summon.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dc20.find(params.expect(:character_id))
        end

        def find_summons
          @summons = @character.children.dc20_summon.order(created_at: :desc)
        end

        def find_summon
          @summon = @character.children.dc20_summon.find(params.expect(:id))
        end

        def summon_params
          params.require(:summon).permit!.to_h
        end
      end
    end
  end
end
