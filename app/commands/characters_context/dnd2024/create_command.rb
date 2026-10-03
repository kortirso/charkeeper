# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class CreateCommand < BaseCommand
      include Deps[
        refresh_feats: 'services.characters_context.dnd2024.refresh_feats',
        add_talent: 'commands.characters_context.dnd2024.talents.add'
      ]

      use_contract do
        config.messages.namespace = :dnd5_character

        Alignments = Dry::Types['strict.string'].enum(*::Dnd2024::Character::ALIGNMENTS)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:species).filled(:string)
          optional(:legacy).filled(:string)
          required(:size).filled(:string)
          required(:main_class).filled(:string)
          required(:alignment).filled(Alignments)
          optional(:background).filled(:string)
          optional(:skip_guide).filled(:bool)
        end
      end

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
        learn_custom_spells_list(character, input)

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
          .ids
          .map do |feat_id|
            {
              character_id: character.id,
              feat_id: feat_id,
              ready_to_use: false,
              value: { prepared_by: input[:main_class] }
            }
          end
        ::Character::Feat.upsert_all(spells) if spells.any?
      end

      def learn_custom_spells_list(character, input) # rubocop: disable Metrics/AbcSize
        return if ::Dnd2024::Character.classes_info[input[:main_class]]

        record = ::Dnd2024::Homebrews::Speciality.find_by(id: input[:main_class])
        return unless record
        return if record.info.learn_spells

        relation = ::Dnd2024::Feat.where(origin: 6)
        spells =
          relation.where("title ->> 'en' IN (:values) OR title ->> 'ru' IN (:values)", values: record.info.spells)
            .or(relation.where(id: record.info.spells))
            .or(relation.where(slug: record.info.spells))
            .ids
            .map do |feat_id|
              {
                character_id: character.id,
                feat_id: feat_id,
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
