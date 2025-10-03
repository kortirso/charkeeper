# frozen_string_literal: true

module HomebrewsContext
  class FindAvailableService
    def call(user_id:)
      {
        daggerheart: {
          races: daggerheart_heritages(user_id),
          communities: daggerheart_communities(user_id),
          classes: daggerheart_classes(user_id),
          subclasses: daggerheart_subclasses(user_id)
        },
        dnd2024: {
          races: dnd2024_races(user_id)
        }
      }
    end

    private

    def dnd2024_races(user_id)
      relation = ::Dnd2024::Homebrew::Race.left_outer_joins(:homebrew_book_items)
      relation.where(user_id: user_id)
        .or(relation.where(homebrew_book_items: { homebrew_book_id: available_books(user_id) }))
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name }, legacies: {}, sizes: item.data.size }
        end
    end

    def daggerheart_heritages(user_id)
      relation = ::Daggerheart::Homebrew::Race.left_outer_joins(:homebrew_book_items)
      relation.where(user_id: user_id)
        .or(relation.where(homebrew_book_items: { homebrew_book_id: available_books(user_id) }))
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name } }
        end
    end

    def daggerheart_communities(user_id)
      relation = ::Daggerheart::Homebrew::Community.left_outer_joins(:homebrew_book_items)
      relation.where(user_id: user_id)
        .or(relation.where(homebrew_book_items: { homebrew_book_id: available_books(user_id) }))
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name } }
        end
    end

    def daggerheart_classes(user_id)
      ::Daggerheart::Homebrew::Speciality.where(user_id: user_id).each_with_object({}) do |item, acc|
        acc[item.id] = { name: { en: item.name, ru: item.name }, domains: item.data.domains }
      end
    end

    def daggerheart_subclasses(user_id)
      relation = ::Daggerheart::Homebrew::Subclass.left_outer_joins(:homebrew_book_items)
      relation.where(user_id: user_id)
        .or(relation.where(homebrew_book_items: { homebrew_book_id: available_books(user_id) }))
        .each_with_object({}) do |item, acc|
          acc[item.class_name] ||= {}
          acc[item.class_name][item.id] = { name: { en: item.name, ru: item.name }, spellcast: item.data.spellcast }
        end
    end

    def available_books(user_id)
      @available_books ||= Homebrew::Book.shared.joins(:user_books).where(user_books: { user_id: user_id }).ids
    end
  end
end
