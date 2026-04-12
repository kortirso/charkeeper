# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Animals
      class ChangeCommand < BaseCommand
        include Deps[cache: 'cache.avatars']

        use_contract do
          config.messages.namespace = :character_animal_companion

          params do
            required(:animal).filled(type?: ::Pathfinder2::Character::AnimalCompanion)
            optional(:name).filled(:string, max_size?: 50)
            optional(:caption).maybe(:string, max_size?: 1_000)
            optional(:file)
          end
        end

        private

        def do_persist(input)
          input[:animal].update!(input.except(:animal, :file))

          upload_avatar(input)

          { result: input[:animal] }
        end

        def upload_avatar(input)
          return unless input[:file]

          input[:animal].avatar.attach(input[:file])
          cache.push_item(item: input[:animal].avatar)
        rescue StandardError => _e
        end
      end
    end
  end
end
