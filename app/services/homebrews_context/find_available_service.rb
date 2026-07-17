# frozen_string_literal: true

module HomebrewsContext
  class FindAvailableService
    def call(user_id:)
      {
        daggerheart: {
          races: races_with_features(user_id).to_h,
          communities: titles(user_id, ::Daggerheart::Homebrews::Community),
          transformations: titles(user_id, ::Daggerheart::Homebrews::Transformation),
          domains: titles(user_id, ::Daggerheart::Homebrews::Domain).merge(domains_from_classes(user_id)),
          classes: daggerheart_classes(user_id),
          subclasses: daggerheart_subclasses(user_id)
        },
        dnd2024: {
          races: dnd2024_races(user_id),
          subclasses: {},
          backgrounds: titles(user_id, ::Dnd2024::Homebrews::Background)
        }
      }
    end

    private

    def titles(user_id, class_name)
      relation = class_name
      relation.where(user_id: user_id)
        .or(
          relation.where(id: available_books_data(user_id))
        )
        .each_with_object({}) { |item, acc| acc[item.id] = { name: item.title } }
    end

    def races_with_features(...)
      daggerheart_heritages(...).map do |key, values|
        [
          key,
          values.merge(
            features: daggerheart_heritage_features(...)[key] || []
          )
        ]
      end
    end

    def dnd2024_races(user_id)
      ::Dnd2024::Homebrews::Race.where(user_id: user_id)
        .or(
          ::Dnd2024::Homebrews::Race.where(id: available_books_data(user_id))
        )
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: item.title, sizes: item.info.size, legacies: [] }
        end
    end

    def daggerheart_heritages(user_id)
      @daggerheart_heritages ||= titles(user_id, ::Daggerheart::Homebrews::Ancestry)
    end

    def daggerheart_heritage_features(...)
      @daggerheart_heritage_features ||=
        ::Daggerheart::Feat
          .where(origin: 0)
          .where(origin_value: daggerheart_heritages(...).keys)
          .order(created_at: :asc)
          .select(:id, :title, :origin_value)
          .each_with_object({}) do |item, acc|
            acc[item.origin_value] ||= []
            acc[item.origin_value].push({ slug: item.id, name: item.title })
          end
    end

    def domains_from_classes(...)
      ::Daggerheart::Homebrews::Domain
        .where(id: daggerheart_classes(...).values.flat_map { |item| item[:domains] }.uniq)
        .each_with_object({}) { |item, acc| acc[item.id] = { name: item.title } }
    end

    def daggerheart_classes(user_id)
      @daggerheart_classes ||=
        ::Daggerheart::Homebrews::Speciality.where(user_id: user_id)
          .or(
            ::Daggerheart::Homebrews::Speciality.where(id: daggerheart_subclasses(user_id).keys)
          )
          .each_with_object({}) do |item, acc|
            acc[item.id] = { name: item.title, domains: item.info.domains }
          end
    end

    def daggerheart_subclasses(user_id)
      @daggerheart_subclasses ||=
        ::Daggerheart::Homebrews::Subclass.where(user_id: user_id)
          .or(
            ::Daggerheart::Homebrews::Subclass.where(id: available_books_data(user_id))
          )
          .each_with_object({}) do |item, acc|
            acc[item.info.class_id] ||= {}
            acc[item.info.class_id][item.id] = { name: item.title, spellcast: item.info.spellcast }
          end
    end

    def available_books_data(user_id)
      @available_books_data ||=
        ::Homebrew::Book::Item
          .where(itemable_type: 'Homebrew')
          .where(homebrew_book_id: ::User::Book.where(user_id: user_id).select(:homebrew_book_id))
          .pluck(:itemable_id)
    end
  end
end
