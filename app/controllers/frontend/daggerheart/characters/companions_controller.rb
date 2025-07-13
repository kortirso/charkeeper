# frozen_string_literal: true

module Frontend
  module Daggerheart
    module Characters
      class CompanionsController < Frontend::BaseController
        include Deps[
          add_companion: 'commands.characters_context.daggerheart.add_companion',
          change_companion: 'commands.characters_context.daggerheart.change_companion'
        ]
        include SerializeResource

        before_action :find_character
        before_action :find_existing_companion, only: %i[create]
        before_action :find_companion, only: %i[show update destroy]

        def show
          serialize_resource(@companion, ::Daggerheart::Characters::CompanionSerializer, :companion, {})
        end

        def create
          case add_companion.call(companion_params.merge(character: @character))
          in { errors: errors } then unprocessable_response(errors)
          in { result: result }
            serialize_resource(result, ::Daggerheart::Characters::CompanionSerializer, :companion, {}, :created)
          end
        end

        def update
          case change_companion.call(companion_params.merge(companion: @companion))
          in { errors: errors } then unprocessable_response(errors)
          in { result: result }
            serialize_resource(result, ::Daggerheart::Characters::CompanionSerializer, :companion, {})
          end
        end

        def destroy
          @companion.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).daggerheart.find(params[:character_id])
        end

        def find_existing_companion
          raise ActiveRecord::RecordNotFound if @character.companion
        end

        def find_companion
          @companion = @character.companion
          raise ActiveRecord::RecordNotFound if @companion.nil?
        end

        def companion_params
          params.require(:companion).permit!.to_h
        end
      end
    end
  end
end
