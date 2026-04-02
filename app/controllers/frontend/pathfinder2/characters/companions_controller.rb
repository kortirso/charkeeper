# frozen_string_literal: true

module Frontend
  module Pathfinder2
    module Characters
      class CompanionsController < Frontend::BaseController
        include Deps[
          add_pet: 'commands.characters_context.pathfinder2.pets.add',
          change_pet: 'commands.characters_context.pathfinder2.pets.change'
        ]
        include SerializeResource

        before_action :find_character
        before_action :find_existing_pet, only: %i[create]
        before_action :find_pet, only: %i[show update destroy]

        def show
          serialize_resource(@pet, ::Pathfinder2::Characters::PetSerializer, :pet, {})
        end

        def create
          case add_pet.call(companion_params.merge(character: @character))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Pathfinder2::Characters::PetSerializer, :pet, {}, :created)
          end
        end

        def update
          case change_pet.call(companion_params.merge(pet: @pet))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result } then serialize_resource(result, ::Pathfinder2::Characters::PetSerializer, :pet, {})
          end
        end

        def destroy
          @pet.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).pathfinder2.find(params[:character_id])
        end

        def find_existing_pet
          raise ActiveRecord::RecordNotFound if @character.pet
        end

        def find_pet
          @pet = @character.pet
          raise ActiveRecord::RecordNotFound if @pet.nil?
        end

        def companion_params
          params[:pet] ? params.require(:pet).permit!.to_h : params.permit!.to_h
        end
      end
    end
  end
end
