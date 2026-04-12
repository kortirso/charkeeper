# frozen_string_literal: true

module Frontend
  module Pathfinder2
    module Characters
      class AnimalsController < Frontend::BaseController
        include Deps[
          add_animal_companion: 'commands.characters_context.pathfinder2.animals.add',
          change_animal_companion: 'commands.characters_context.pathfinder2.animals.change',
          upgrade_animal_companion: 'commands.characters_context.pathfinder2.animals.upgrade'
        ]
        include SerializeResource

        before_action :find_character
        before_action :find_existing_animal_companion, only: %i[create]
        before_action :find_animal_companion, only: %i[show update destroy upgrade]

        def show
          serialize_resource(@animal, ::Pathfinder2::Characters::AnimalCompanionSerializer, :animal, {})
        end

        def create
          case add_animal_companion.call(companion_params.merge(character: @character))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Pathfinder2::Characters::AnimalCompanionSerializer, :animal, {}, :created)
          end
        end

        def update
          case change_animal_companion.call(companion_params.merge(animal: @animal))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Pathfinder2::Characters::AnimalCompanionSerializer, :animal, {})
          end
        end

        def destroy
          @animal.destroy
          only_head_response
        end

        def upgrade
          case upgrade_animal_companion.call(animal: @animal)
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Pathfinder2::Characters::AnimalCompanionSerializer, :animal, {})
          end
        end

        private

        def find_character
          @character = authorized_scope(Character.all).pathfinder2.find(params[:character_id])
        end

        def find_existing_animal_companion
          raise ActiveRecord::RecordNotFound if @character.animal_companion
        end

        def find_animal_companion
          @animal = @character.animal_companion
          raise ActiveRecord::RecordNotFound if @animal.nil?
        end

        def companion_params
          params[:animal] ? params.require(:animal).permit!.to_h : params.permit!.to_h
        end
      end
    end
  end
end
