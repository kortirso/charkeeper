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
          optional(:abilities).hash do
            required(:str).filled(:integer)
            required(:per).filled(:integer)
            required(:end).filled(:integer)
            required(:cha).filled(:integer)
            required(:int).filled(:integer)
            required(:agi).filled(:integer)
            required(:lck).filled(:integer)
          end
          optional(:name).filled(:string, max_size?: 50)
          optional(:file)
        end

        rule(:abilities) do
          next if value.nil?
          next if value.values.all? { |item| item.between?(4, 10) }

          key.failure(:invalid_value)
        end
      end

      private

      def lock_key(input) = "character_update_#{input[:character].id}"
      def lock_time = 0

      # rubocop: disable Style/GuardClause
      def do_prepare(input)
        %i[attributes].each do |key|
          input[key]&.transform_values!(&:to_i)
        end

        if input.key?(:attributes)
          input[:attibute_boosts] = nil

          if input[:character].data.skill_boosts.present?
            input[:skill_boosts] = input[:character].data.skill_boosts
            input[:skill_boosts] += input.dig(:attributes, :int)
          end
        end
      end
      # rubocop: enable Style/GuardClause

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character, :file, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        upload_avatar(input)

        { result: input[:character] }
      end

      def upload_avatar(input)
        return if input.slice(:file).keys.blank?

        input[:character].avatar.attach(input[:file]) if input[:file]
        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
