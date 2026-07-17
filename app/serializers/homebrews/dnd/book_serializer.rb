# frozen_string_literal: true

module Homebrews
  module Dnd
    class BookSerializer < ApplicationSerializer
      attributes :id, :title, :provider, :items, :shared, :public, :enabled, :own, :upvotes_count, :upvoted

      def title
        object.name
      end

      def items
        items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }

        {
          items: transform(::Dnd5::Item.where(id: items['Item']).pluck(:id, :name)),
          classes: subclasses_info(items),
          spells: transform(feats(items, 6).pluck(:id, :title)),
          feats: transform(feats(items, 4).pluck(:id, :title)),
          backgrounds: titles(items, ::Dnd2024::Homebrews::Background, 'Homebrew'),
          races: titles(items, ::Dnd2024::Homebrews::Race, 'Homebrew')
        }
      end

      def enabled # rubocop: disable Naming/PredicateMethod
        context && context[:enabled_books] ? context[:enabled_books].include?(object.id) : false
      end

      def own # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:current_user_id]

        object.user_id == context[:current_user_id]
      end

      def upvoted # rubocop: disable Naming/PredicateMethod
        return false unless context
        return false unless context[:upvotes]

        context[:upvotes].include?(object.id)
      end

      def subclasses_info(object_items) # rubocop: disable Metrics/AbcSize
        subclasses =
          ::Dnd2024::Homebrews::Subclass
            .where(id: object_items['Homebrew'])
            .hashable_pluck(:id, :title, :info)
            .group_by { |item| item[:info].class_id }
        subclasses
          .transform_keys do |key|
            default = ::Dnd2024::Character.class_info(key)
            next translate(default['name']) if default

            translate(dnd_names.fetch_item(key: :classes, id: key)[:name])
          end.transform_values { |value| value.each_with_object({}) { |item, acc| acc[item[:id]] = translate(item[:title]) } }
      end

      def feats(object_items, origin)
        ::Dnd2024::Feat.where(origin: origin).where(id: object_items['Feat'].to_a)
      end

      def titles(object_items, model, key)
        transform(model.where(id: object_items[key]).pluck(:id, :title))
      end

      def transform(values)
        values.to_h.transform_values { |item| translate(item) }
      end

      def dnd_names = Charkeeper::Container.resolve('cache.dnd_names')
    end
  end
end
