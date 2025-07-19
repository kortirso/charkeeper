# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class CreateCommand < BaseCommand
      include Deps[
        attach_avatar_by_url: 'commands.image_processing.attach_avatar_by_url',
        attach_avatar_by_file: 'commands.image_processing.attach_avatar_by_file',
        refresh_feats: 'services.characters_context.dnd2024.refresh_feats'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :dnd5_character

        Species = Dry::Types['strict.string'].enum(*::Dnd2024::Character.species.keys)
        Classes = Dry::Types['strict.string'].enum(*::Dnd2024::Character.classes_info.keys)
        Alignments = Dry::Types['strict.string'].enum(*::Dnd2024::Character::ALIGNMENTS)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string)
          required(:species).filled(Species)
          optional(:legacy).filled(:string)
          required(:size).filled(:string)
          required(:main_class).filled(Classes)
          required(:alignment).filled(Alignments)
          optional(:avatar_file).hash do
            required(:file_content).filled(:string)
            required(:file_name).filled(:string)
          end
          optional(:avatar_url).filled(:string)
        end

        rule(:avatar_file, :avatar_url).validate(:check_only_one_present)

        rule(:species, :size) do
          next if values[:species].nil?

          species_sizes = ::Dnd2024::Character.sizes_info(values[:species])
          next if species_sizes&.include?(values[:size])

          key(:size).failure(:invalid)
        end

        rule(:species, :legacy) do
          next if values[:legacy].nil?

          legacies = ::Dnd2024::Character.legacies_info(values[:species]).keys
          next if legacies&.include?(values[:legacy])

          key(:legacy).failure(:invalid)
        end
      end
      # rubocop: enable Metrics/BlockLength

      private

      def do_prepare(input)
        input[:data] =
          build_fresh_character(input.slice(:species, :legacy, :size, :main_class, :alignment).symbolize_keys)
      end

      def do_persist(input)
        character = ::Dnd2024::Character.create!(input.slice(:user, :name, :data))
        refresh_feats.call(character: character)

        learn_spells_list(character, input)
        attach_avatar_by_file.call({ character: character, file: input[:avatar_file] }) if input[:avatar_file]
        attach_avatar_by_url.call({ character: character, url: input[:avatar_url] }) if input[:avatar_url]

        { result: character }
      end

      def build_fresh_character(data)
        Dnd2024Character::BaseBuilder.new.call(result: data)
          .then { |result| Dnd2024Character::SpeciesBuilder.new.call(result: result) }
          .then { |result| Dnd2024Character::LegaciesBuilder.new.call(result: result) }
          .then { |result| Dnd2024Character::ClassBuilder.new.call(result: result) }
      end

      def learn_spells_list(character, input)
        return if ::Dnd2024::Character::CLASSES_KNOW_SPELLS_LIST.exclude?(input[:main_class])

        spells = ::Dnd2024::Spell.all.filter_map do |spell|
          next if spell.data.available_for.exclude?(input[:main_class])

          {
            character_id: character.id,
            spell_id: spell.id,
            data: { ready_to_use: false, prepared_by: input[:main_class] }
          }
        end

        ::Character::Spell.upsert_all(spells)
      end
    end
  end
end
