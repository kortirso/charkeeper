# frozen_string_literal: true

module SerializeRelation
  extend ActiveSupport::Concern

  private

  def serialize_relation(relation, serializer, key, serialized_fields={}, context={})
    context = default_context.merge(context)
    render json: Panko::Response.new(
      key => Panko::ArraySerializer.new(
        relation,
        each_serializer: serializer,
        **serialized_fields,
        context: context
      )
    ), status: :ok
  end

  def serialize_relation_v2(relation, serializer, key, serialized_fields: {}, context: {}, cache_options: {}, order_options: {})
    json =
      check_cache_value(cache_options) do
        data = Panko::ArraySerializer.new(
          relation,
          each_serializer: serializer,
          **serialized_fields,
          context: default_context.merge(context)
        ).serialize(relation)
        data.sort_by! { |item| item[order_options[:key]] } if order_options[:key]
        data
      end

    render json: { key => json }, status: :ok
  end

  def check_cache_value(cache_options, &block)
    return yield unless cache_options[:key]

    Rails.cache.fetch(cache_options[:key], expires_in: cache_options[:expires_in], race_condition_ttl: 10.seconds, &block)
  end

  def default_context
    { version: params[:version] }.compact
  end
end
