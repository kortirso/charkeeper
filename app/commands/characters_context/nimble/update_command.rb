# frozen_string_literal: true

module CharactersContext
  module Nimble
    class UpdateCommand < BaseCommand
      include Deps[
        cache: 'cache.avatars',
        add_feat: 'commands.characters_context.nimble.feats.add'
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

      def do_prepare(input)
        input[:skill_points] = input[:character].data.skill_points + 1 if input.key?(:level)
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character, :file, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        refresh_feats(input) if input.key?(:level)
        upload_avatar(input)

        { result: input[:character] }
      end

      def refresh_feats(input)
        feats_relation(input).each { |feat| add_feat.call({ character: input[:character], feat: feat }) }
      end

      def feats_relation(input)
        data = input[:character].data
        result =
          ::Nimble::Feat.where(origin: 1, origin_value: data.main_class).where("conditions ->> 'level' = '#{input[:level]}'")
        if data.subclass
          result =
            result.or(
              ::Nimble::Feat.where(origin: 2, origin_value: data.subclass).where("conditions ->> 'level' = '#{input[:level]}'")
            )
        end
        result
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
