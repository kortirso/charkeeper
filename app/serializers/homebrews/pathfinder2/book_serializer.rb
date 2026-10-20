# frozen_string_literal: true

module Homebrews
  module Pathfinder2
    class BookSerializer < ApplicationSerializer
      attributes :id, :title, :provider, :items, :shared, :public, :enabled, :own, :upvotes_count, :upvoted

      def title
        object.name
      end

      def items
        items = object.items.group_by(&:itemable_type).transform_values { |item| item.pluck(:itemable_id) }

        {
          items: transform(::Pathfinder2::Item.kept.where(id: items['Item']).pluck(:id, :name)),
          backgrounds: titles(items, ::Pathfinder2::Homebrews::Background, 'Homebrew'),
          classes: subclasses_info(items),
          spells: transform(feats(items, 4).pluck(:id, :title)),
          feats: transform(feats(items, [0, 2]).pluck(:id, :title))
        }
      end

      def subclasses_info(object_items) # rubocop: disable Metrics/AbcSize
        subclasses =
          ::Pathfinder2::Homebrews::Subclass
            .where(id: object_items['Homebrew'])
            .hashable_pluck(:id, :title, :info)
            .group_by { |item| item[:info].class_id }
        subclasses
          .transform_keys do |key|
            default = ::Pathfinder2::Character.class_info(key)
            next translate(default['name']) if default

            translate(pathfinder_names.fetch_item(key: :specialities, id: key)[:name])
          end.transform_values { |value| value.each_with_object({}) { |item, acc| acc[item[:id]] = translate(item[:title]) } }
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

      def titles(object_items, model, key)
        model.where(id: object_items[key]).pluck(:id, :title).to_h.transform_values { |item| translate(item) }
      end

      def transform(values)
        values.to_h.transform_values { |item| translate(item) }
      end

      def feats(object_items, origin)
        ::Pathfinder2::Feat.where(origin: origin).where(id: object_items['Feat'].to_a)
      end

      def pathfinder_names = Charkeeper::Container.resolve('cache.pathfinder2_names')
    end
  end
end
