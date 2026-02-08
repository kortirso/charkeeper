# frozen_string_literal: true

module CharactersContext
  module Fate
    class UpdateCommand < BaseCommand
      include Deps[cache: 'cache.avatars']

      use_contract do
        config.messages.namespace = :fate_character

        params do
          required(:character).filled(type?: ::Fate::Character)
          optional(:name).filled(:string, max_size?: 50)
          optional(:aspects).hash do
            required(:concept).maybe(:string, max_size?: 100)
            required(:trouble).maybe(:string, max_size?: 100)
            required(:a).maybe(:string, max_size?: 100)
            required(:b).maybe(:string, max_size?: 100)
            required(:c).maybe(:string, max_size?: 100)
          end
          optional(:phase_trio).hash do
            required(:a).maybe(:string, max_size?: 1000)
            required(:b).maybe(:string, max_size?: 1000)
            required(:c).maybe(:string, max_size?: 1000)
          end
          optional(:selected_skills).hash
          optional(:file)
        end
      end

      private

      def do_prepare(input)
        input[:data] = input[:character].data.attributes.merge(input.except(:character, :name, :file).stringify_keys)
      end

      def do_persist(input)
        input[:character].update!(input.slice(:name, :data))

        upload_avatar(input)

        { result: input[:character] }
      end

      def upload_avatar(input)
        return unless input.key?(:file)

        input[:character].avatar.attach(input[:file])
        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
