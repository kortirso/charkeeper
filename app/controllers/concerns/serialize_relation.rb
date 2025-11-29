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

  def default_context
    { version: params[:version] }.compact
  end
end
