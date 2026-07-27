# frozen_string_literal: true

module CharactersContext
  module Nimble
    class UpdateCommand < BaseCommand
      include Deps[
        cache: 'cache.avatars'
      ]

      use_contract do
        params do
          required(:character).filled(type?: ::Nimble::Character)
          optional(:subclass).filled(:string)
          optional(:level).filled(:integer)
          optional(:abilities).hash do
            required(:str).filled(:integer, gteq?: -1, lteq?: 7)
            required(:dex).filled(:integer, gteq?: -1, lteq?: 7)
            required(:int).filled(:integer, gteq?: -1, lteq?: 7)
            required(:wil).filled(:integer, gteq?: -1, lteq?: 7)
          end
          optional(:health).hash do
            required(:current).filled(:integer, gteq?: 0)
            required(:temp).filled(:integer, gteq?: 0)
            required(:max).filled(:integer, gteq?: 1)
          end
          optional(:name).filled(:string, max_size?: 50)
          optional(:file)
          optional(:guide_step).maybe(:integer)
          optional(:skill_levels).hash
          optional(:skill_points).maybe(:integer)
          optional(:hit_die_spent).maybe(:integer)
          optional(:wounds_spent).maybe(:integer)
          optional(:languages).value(:array).each(:string)
        end
      end

      private

      def lock_key(input) = "character_update_#{input[:character].id}"
      def lock_time = 0

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character, :file, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        upload_avatar(input)

        { result: input[:character] }
      end

      def upload_avatar(input)
        return unless input[:file]

        input[:character].avatar.attach(input[:file])
        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
