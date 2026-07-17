# frozen_string_literal: true

module CharactersContext
  module Fallout
    class UpdateCommand < BaseCommand
      include Deps[
        cache: 'cache.avatars'
      ]

      use_contract do
        config.messages.namespace = :fallout_character

        params do
          required(:character).filled(type?: ::Fallout::Character)
          optional(:level).filled(:integer)
          optional(:abilities).hash do
            required(:str).filled(:integer, gteq?: 4, lteq?: 10)
            required(:per).filled(:integer, gteq?: 4, lteq?: 10)
            required(:end).filled(:integer, gteq?: 4, lteq?: 10)
            required(:cha).filled(:integer, gteq?: 4, lteq?: 10)
            required(:int).filled(:integer, gteq?: 4, lteq?: 10)
            required(:agi).filled(:integer, gteq?: 4, lteq?: 10)
            required(:lck).filled(:integer, gteq?: 4, lteq?: 10)
          end
          optional(:skills).hash
          optional(:tag_skills).value(:array).each(:string)
          optional(:name).filled(:string, max_size?: 50)
          optional(:file)
          optional(:guide_step).maybe(:integer)
        end
      end

      private

      def lock_key(input) = "character_update_#{input[:character].id}"
      def lock_time = 0

      def do_prepare(input) # rubocop: disable Metrics/AbcSize
        %i[abilities].each do |key|
          input[key]&.transform_values!(&:to_i)
        end

        if input.key?(:level)
          input[:skill_boosts] = input[:character].data.skill_boosts + 1
          input[:perks_boosts] = input[:character].data.perks_boosts + 1
        end

        if input.key?(:abilities)
          input[:ability_boosts] = 0

          if input[:character].data.level == 1
            input[:skill_boosts] = input[:character].data.skill_boosts + input.dig(:abilities, :int)
          end
        end

        if input.key?(:skills)
          input[:skill_boosts] = 0
          input[:tag_skill_boosts] = 0
        end
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character, :file, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

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
