# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class UpdateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file',
        refresh_feats: 'services.characters_context.daggerheart.refresh_feats',
        cache: 'cache.avatars'
      ]

      REFRESH_ATTRIBUTES = %i[
        level classes subclasses subclasses_mastery transformation beastform selected_features community
      ].freeze

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :daggerheart_character

        Beastforms = Dry::Types['strict.string'].enum(*::Daggerheart::Character.beastforms.keys)

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          optional(:level).filled(:integer)
          optional(:classes).hash
          optional(:domains).hash
          optional(:subclasses).hash
          optional(:subclasses_mastery).hash
          optional(:traits).hash do
            required(:str).filled(:integer)
            required(:agi).filled(:integer)
            required(:fin).filled(:integer)
            required(:ins).filled(:integer)
            required(:pre).filled(:integer)
            required(:know).filled(:integer)
          end
          optional(:spent_armor_slots).filled(:integer)
          optional(:health_marked).filled(:integer)
          optional(:stress_marked).filled(:integer)
          optional(:hope_marked).filled(:integer)
          optional(:gold).hash do # TODO: deprecated
            required(:coins).filled(:integer)
            required(:handfuls).filled(:integer)
            required(:bags).filled(:integer)
            required(:chests).filled(:integer)
          end
          optional(:money).filled(:integer, gteq?: 0)
          optional(:leveling).hash
          optional(:name).filled(:string, max_size?: 50)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
          optional(:file)
          optional(:experience).maybe(:array).each(:hash) do
            required(:id).filled(:integer)
            required(:exp_name).filled(:string, max_size?: 50)
            required(:exp_level).filled(:integer, gteq?: 0)
          end
          optional(:beastform).maybe(Beastforms)
          optional(:transformation).maybe(:string)
          optional(:selected_stances).maybe(:array).each(:string)
          optional(:stance).maybe(:string)
          optional(:selected_features).hash
          optional(:guide_step).maybe(:integer)
          optional(:conditions).maybe(:array).each(:string)
          optional(:scars).maybe(:array).each(:hash) do
            required(:id).filled(:integer)
            required(:name).filled(:string, max_size?: 500)
          end
          optional(:heritage_name).filled(:string, max_size?: 50)
          required(:community).filled(:string)
        end

        rule(:avatar_file, :avatar_url, :file).validate(:check_only_one_present)

        rule(:traits) do
          next if value.nil?
          next if value.values.all? { |item| item.between?(-5, 5) }

          key.failure(:invalid_value)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input) # rubocop: disable Metrics/AbcSize
        %i[traits energy].each do |key|
          input[key]&.transform_values!(&:to_i)
        end

        if input.key?(:money)
          chests, modulus = input[:money].divmod(1_000)
          bags, modulus = modulus.divmod(100)
          handfuls, coins = modulus.divmod(10)
          input[:gold] = { chests: chests, bags: bags, handfuls: handfuls, coins: coins }
        elsif input.key?(:gold)
          input[:money] =
            (input.dig(:gold, :chests) * 1_000) +
            (input.dig(:gold, :bags) * 100) +
            (input.dig(:gold, :handfuls) * 10) +
            input.dig(:gold, :coins)
        end
      end

      def do_persist(input) # rubocop: disable Metrics/AbcSize
        input[:character].data =
          input[:character].data
            .attributes.merge(input.except(:character, :avatar_file, :avatar_url, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        if REFRESH_ATTRIBUTES.intersect?(input.keys)
          refresh_feats.call(character: input[:character])
        end
        upload_avatar(input)

        { result: input[:character] }
      end

      def upload_avatar(input) # rubocop: disable Metrics/AbcSize
        return if input.slice(:avatar_file, :avatar_url, :file).keys.blank?

        attach_avatar_by_file.call({ character: input[:character], file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: input[:character], url: input[:avatar_url] }) if input[:avatar_url]
        input[:character].avatar.attach(input[:file]) if input[:file]

        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
