# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Pets
      class ChangeCommand < BaseCommand
        include Deps[cache: 'cache.avatars']

        use_contract do
          config.messages.namespace = :character_companion

          params do
            required(:pet).filled(type?: ::Pathfinder2::Character::Pet)
            optional(:name).filled(:string, max_size?: 50)
            optional(:caption).maybe(:string, max_size?: 1_000)
            optional(:file)
          end
        end

        private

        def do_persist(input)
          input[:pet].update!(input.except(:pet, :file))

          upload_avatar(input)

          { result: input[:pet] }
        end

        def upload_avatar(input)
          return unless input[:file]

          input[:pet].avatar.attach(input[:file])
          cache.push_item(item: input[:pet].avatar)
        rescue StandardError => _e
        end
      end
    end
  end
end
