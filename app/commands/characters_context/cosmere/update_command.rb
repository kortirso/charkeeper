# frozen_string_literal: true

module CharactersContext
  module Cosmere
    class UpdateCommand < BaseCommand
      include Deps[
        cache: 'cache.avatars'
      ]

      use_contract do
        config.messages.namespace = :cosmere_character

        params do
          required(:character).filled(type?: ::Cosmere::Character)
          optional(:level).filled(:integer)
          optional(:abilities).hash do
            required(:str).filled(:integer, gteq?: 0)
            required(:spd).filled(:integer, gteq?: 0)
            required(:int).filled(:integer, gteq?: 0)
            required(:wil).filled(:integer, gteq?: 0)
            required(:awa).filled(:integer, gteq?: 0)
            required(:pre).filled(:integer, gteq?: 0)
          end
          optional(:selected_skills).hash
          optional(:additional_skills).hash
          optional(:name).filled(:string, max_size?: 50)
          optional(:file)
          optional(:guide_step).maybe(:integer)
          optional(:attribute_points).filled(:integer, gteq?: 0)
          optional(:skill_points).filled(:integer, gteq?: 0)
        end

        rule(:abilities) do
          next if value.nil?
          next if value.values.all? { |item| item.between?(0, 20) }

          key.failure(:invalid_value)
        end
      end

      private

      def lock_key(input) = "character_update_#{input[:character].id}"
      def lock_time = 0

      def do_prepare(input)
        %i[abilities].each do |key|
          input[key]&.transform_values!(&:to_i)
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
