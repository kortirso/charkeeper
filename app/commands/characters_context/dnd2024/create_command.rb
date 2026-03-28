# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class CreateCommand < BaseCommand
      include Deps[
        refresh_feats: 'services.characters_context.dnd2024.refresh_feats',
        add_talent: 'commands.characters_context.dnd2024.talents.add'
      ]

      # rubocop: disable Metrics/BlockLength
      use_contract do
        config.messages.namespace = :dnd5_character

        Classes = Dry::Types['strict.string'].enum(*::Dnd2024::Character.classes_info.keys)
        Alignments = Dry::Types['strict.string'].enum(*::Dnd2024::Character::ALIGNMENTS)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:species).filled(:string)
          optional(:legacy).filled(:string)
          required(:size).filled(:string)
          required(:main_class).filled(Classes)
          required(:alignment).filled(Alignments)
          optional(:background).filled(:string)
          optional(:skip_guide).filled(:bool)
        end

        rule(:species, :user) do
          next if values[:species].blank?
          next if values[:species].in?(::Dnd2024::Character.species.keys)
          next if values[:species].in?(::Dnd2024::Homebrew::Race.where(user_id: values[:user].id).ids)

          key.failure(:included_in?)
        end

        rule(:species, :size) do
          next if values[:species].nil?

          species_sizes =
            if values[:species].in?(::Dnd2024::Character.species.keys)
              ::Dnd2024::Character.sizes_info(values[:species])
            else
              ::Dnd2024::Homebrew::Race.find_by(id: values[:species])&.data&.size
            end
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
          build_fresh_character(
            input.slice(:species, :legacy, :size, :main_class, :alignment, :background, :skip_guide).symbolize_keys
          )
      end

      def do_persist(input)
        character = ::Dnd2024::Character.create!(input.slice(:user, :name, :data))
        refresh_feats.call(character: character)

        talent = input.dig(:data, :selected_feats)
        add_talent.call(
          character: character,
          talent: ::Dnd2024::Feat.find_by(slug: talent) || ::Dnd2024::Feat.find_by(id: talent)
        )
        learn_spells_list(character, input)

        { result: character }
      end

      def build_fresh_character(data)
        Dnd2024Character::BaseBuilder.new.call(result: data)
          .then { |result| Dnd2024Character::SpeciesBuilder.new.call(result: result) }
          .then { |result| Dnd2024Character::LegaciesBuilder.new.call(result: result) }
          .then { |result| Dnd2024Character::ClassBuilder.new.call(result: result) }
          .then { |result| Dnd2024Character::BackgroundBuilder.new.call(result: result) }
      end

      def learn_spells_list(character, input)
        return if ::Dnd2024::Character::CLASSES_KNOW_SPELLS_LIST.exclude?(input[:main_class])

        relation = ::Dnd2024::Feat.where(origin: 6).where('origin_values && ?', "{#{input[:main_class]}}")
        spells =
          relation.where(user_id: [nil, input[:user].id]).or(relation.where(id: homebrew_item_ids(input)))
          .map do |feat|
            {
              character_id: character.id,
              feat_id: feat.id,
              ready_to_use: false,
              value: { prepared_by: input[:main_class] }
            }
          end
        ::Character::Feat.upsert_all(spells) if spells.any?
      end

      def homebrew_item_ids(input)
        ::Homebrew::Book::Item
          .where(homebrew_book_id: ::User::Book.where(user_id: input[:user]).select(:homebrew_book_id))
          .where(itemable_type: 'Dnd2024::Feat')
          .pluck(:itemable_id)
      end
    end
  end
end
